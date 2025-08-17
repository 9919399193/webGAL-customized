self.addEventListener('install', (ev) => {
  // 清理旧缓存
  ev.waitUntil(
    caches.keys()
      .then(cacheNames => {
        return Promise.all(
          cacheNames.map(cacheName => {
            if (cacheName !== 'webgal-cache') {
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => self.skipWaiting())
  );
});

// fetch事件是每次页面请求资源时触发的
self.addEventListener('fetch', function (event) {
  const url = event.request.url;
  const isReturnCache = !!(url.match('/assets/') && !url.match('game'));
  
  // 确保只对 GET 请求使用缓存
  if (!isReturnCache || event.request.method !== 'GET') {
    // 对于非缓存请求，添加错误处理
    event.respondWith(
      fetch(event.request)
        .catch(error => {
          console.error('Fetch failed:', error);
          return new Response('Network request failed', {
            status: 500,
            headers: { 'Content-Type': 'text/plain' },
          });
        })
    );
    return;
  } else {
    event.respondWith(
      // 检查在缓存中是否有匹配的资源
      caches.match(event.request).then(function (response) {
        // 如果缓存中有匹配的资源，则返回缓存资源
        if (response) {
          return response;
        }
        // 如果没有匹配的资源，则尝试从网络请求
        // 同时将获取的资源存入缓存
        return fetch(event.request)
          .then(function (networkResponse) {
            console.log('%cCACHED: ' + url, 'color: #005CAF; padding: 2px;');
            if (!networkResponse.ok) {
              throw new Error(`HTTP error! status: ${networkResponse.status}`);
            }
            
            if (networkResponse.status === 206 && event.request.headers.has('range')) {
              // 如果是部分响应且请求带有Range头，则创建新的请求，将完整响应返回给客户端
              return fetch(event.request.url).then(function (fullNetworkResponse) {
                if (!fullNetworkResponse.ok) {
                  throw new Error(`HTTP error! status: ${fullNetworkResponse.status}`);
                }
                const headers = {};
                for (let entry of fullNetworkResponse.headers.entries()) {
                  headers[entry[0]] = entry[1];
                }
                const fullResponse = new Response(fullNetworkResponse.body, {
                  status: fullNetworkResponse.status,
                  statusText: fullNetworkResponse.statusText,
                  headers: headers,
                });
                const clonedResponse = fullResponse.clone();
                return caches.open('webgal-cache').then(function (cache) {
                  return cache.put(event.request, clonedResponse)
                    .then(() => fullResponse);
                });
              });
            }
            const clonedResponse = networkResponse.clone();
            // eslint-disable-next-line max-nested-callbacks
            caches.open('my-cache').then(function (cache) {
              cache.put(event.request, clonedResponse);
            });
            return networkResponse;
          })
          .catch(function (error) {
            console.error('Fetching failed:', error);
            throw error;
          });
      }),
    );
  }
});
