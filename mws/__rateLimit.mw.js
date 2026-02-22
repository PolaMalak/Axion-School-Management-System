module.exports = ({ meta, config, managers }) => {
    return async ({ req, res, next }) => {
        const cache = managers.cache;
        const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress || 'unknown';
        const key = `rateLimit:${ip}`;
        
        const windowMs = meta?.windowMs || 15 * 60 * 1000;
        const maxRequests = meta?.maxRequests || 100;
        
        try {
            const current = await cache.get(key);
            
            if (current === null) {
                await cache.set(key, '1', windowMs / 1000);
                return next();
            }
            
            const count = parseInt(current);
            
            if (count >= maxRequests) {
                return managers.responseDispatcher.dispatch(res, {
                    ok: false,
                    code: 429,
                    errors: 'Too many requests. Please try again later.'
                });
            }
            
            await cache.set(key, (count + 1).toString(), windowMs / 1000);
            next();
        } catch (error) {
            console.error('Rate limit error:', error);
            next();
        }
    }
}
