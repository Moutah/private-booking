import passport from "passport";
import { Strategy, ExtractJwt } from "passport-jwt";

/**
 * Token validity duration in seconds.
 */
export let TOKEN_LIFESPAN = 60 * 60;

/**
 * Sets `TOKEN_LIFESPAN` from env value if defined and adds the jwt strategy to
 * passport. The strategy checks that the Bearer token is a valid JWT and sets
 * `req.user` to an object with `_id` being the id of the user of the token.
 */
export const setupPassportJWTStrategy = () => {
  // set token lifespan from env value
  if (process.env.TOKEN_LIFESPAN) {
    TOKEN_LIFESPAN = parseInt(process.env.TOKEN_LIFESPAN);
  }

  passport.use(
    "jwt",
    new Strategy(
      {
        secretOrKey: process.env.APP_KEY,
        jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      },
      async (token, done) => {
        return done(null, { _id: token.sub });
      }
    )
  );
};
