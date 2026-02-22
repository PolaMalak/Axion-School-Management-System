module.exports = ({ meta, config, managers, mongomodels }) => {
  return async ({ req, res, next }) => {
    if (!req.headers.authorization) {
      return managers.responseDispatcher.dispatch(res, {
        ok: false,
        code: 401,
        errors: "unauthorized",
      });
    }
    let decoded = null;
    try {
      decoded = managers.token.verifyShortToken({
        token: req.headers.authorization.split(" ")[1],
      });
      if (!decoded) {
        console.log("failed to decode-1");
        return managers.responseDispatcher.dispatch(res, {
          ok: false,
          code: 401,
          errors: "unauthorized",
        });
      }

      if (mongomodels && mongomodels.user) {
        const userModel = mongomodels.user;
        const user = await userModel.findById(decoded.userId);
        if (!user || !user.isActive) {
          return managers.responseDispatcher.dispatch(res, {
            ok: false,
            code: 401,
            errors: "unauthorized",
          });
        }
        decoded.role = user.role;
        decoded.schoolId = user.schoolId ? user.schoolId.toString() : null;
      }
    } catch (err) {
      console.log("failed to decode-2");
      return managers.responseDispatcher.dispatch(res, {
        ok: false,
        code: 401,
        errors: "unauthorized",
      });
    }
    next(decoded);
  };
};
