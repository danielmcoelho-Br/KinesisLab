try {
    const fm = require('framer-motion');
    console.log('framer-motion found:', typeof fm);
} catch (e) {
    console.error('framer-motion NOT found');
    process.exit(1);
}
