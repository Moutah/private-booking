import passport from "passport";
import { Strategy, ExtractJwt } from "passport-jwt";

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

/**
 * Token validity duration in seconds.
 */
export let TOKEN_LIFESPAN = 60 * 60;
