module.exports = ({ meta, config, managers }) => {
    return ({ req, res, next, __shortToken }) => {
        if (!__shortToken) {
            return managers.responseDispatcher.dispatch(res, { ok: false, code: 401, errors: 'unauthorized' });
        }

        const allowedRoles = meta?.allowedRoles || [];
        
        if (allowedRoles.length > 0 && !allowedRoles.includes(__shortToken.role)) {
            return managers.responseDispatcher.dispatch(res, { 
                ok: false, 
                code: 403, 
                errors: 'Forbidden: Insufficient permissions' 
            });
        }

        next();
    }
}
