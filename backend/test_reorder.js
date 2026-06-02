const axios = require('axios');

async function testReorder() {
    const API_BASE = 'http://localhost:3003'; 
    try {
        const res = await axios.get(`${API_BASE}/api/banners`);
        const banners = res.data;
        console.log('Current order:', banners.map(b => ({ id: b.id, pos: b.position })));
        
        if (banners.length < 2) {
            console.log('Not enough banners to test.');
            return;
        }

        const reversedIds = banners.map(b => b.id).reverse();
        console.log('Reversing order...');
        
        await axios.post(`${API_BASE}/api/banners/reorder`, { orderedIds: reversedIds });
        
        const res2 = await axios.get(`${API_BASE}/api/banners`);
        console.log('New order:', res2.data.map(b => ({ id: b.id, pos: b.position })));
    } catch (err) {
        console.error('Test failed:', err.message);
    }
}

testReorder();
