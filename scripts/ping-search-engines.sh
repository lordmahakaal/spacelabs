#!/bin/bash

SITE_URL="https://spacelabs.pro"
SITEMAP_URL="${SITE_URL}/sitemap.xml"

echo "🚀 Pinging search engines with sitemap: ${SITEMAP_URL}"
echo "=================================================="

echo ""
echo "📡 Notifying Google..."
google_result=$(curl -s -o /dev/null -w "%{http_code}" "https://www.google.com/ping?sitemap=${SITEMAP_URL}")
if [ "$google_result" = "200" ]; then
    echo "   ✅ Google notified successfully"
else
    echo "   ⚠️  Google response: $google_result"
fi

echo ""
echo "📡 Notifying Bing..."
bing_result=$(curl -s -o /dev/null -w "%{http_code}" "https://www.bing.com/ping?sitemap=${SITEMAP_URL}")
if [ "$bing_result" = "200" ]; then
    echo "   ✅ Bing notified successfully"
else
    echo "   ⚠️  Bing response: $bing_result"
fi

echo ""
echo "📡 Notifying Yandex..."
yandex_result=$(curl -s -o /dev/null -w "%{http_code}" "https://webmaster.yandex.com/ping?sitemap=${SITEMAP_URL}")
if [ "$yandex_result" = "200" ]; then
    echo "   ✅ Yandex notified successfully"
else
    echo "   ⚠️  Yandex response: $yandex_result"
fi

echo ""
echo "📡 Notifying DuckDuckGo..."
ddg_result=$(curl -s -o /dev/null -w "%{http_code}" "https://duckduckgo.com/ping?url=${SITEMAP_URL}")
if [ "$ddg_result" = "200" ]; then
    echo "   ✅ DuckDuckGo notified successfully"
else
    echo "   ⚠️  DuckDuckGo response: $ddg_result"
fi

echo ""
echo "📡 Notifying Baidu..."
baidu_result=$(curl -s -o /dev/null -w "%{http_code}" "https://www.baidu.com/search?q=site:${SITE_URL}")
if [ "$baidu_result" = "200" ]; then
    echo "   ✅ Baidu notified successfully"
else
    echo "   ⚠️  Baidu response: $baidu_result"
fi

echo ""
echo "=================================================="
echo "✅ Search engine ping complete!"
echo "🌐 Site: ${SITE_URL}"
echo "📄 Sitemap: ${SITEMAP_URL}"
