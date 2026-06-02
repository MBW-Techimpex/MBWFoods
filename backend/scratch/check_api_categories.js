async function check() {
    try {
        const res = await fetch('http://localhost:3003/api/categories');
        const data = await res.json();
        console.log('API Categories:', JSON.stringify(data, null, 2));
    } catch (e) {
        console.log('Error:', e.message);
    }
}
check();
