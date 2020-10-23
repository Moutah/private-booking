import passport from "passport";
import { Strategy, ExtractJwt } from "passport-jwt";

export const setupPassportJWTStrategy = () =>
  passport.use(
    "jwt",
    new Strategy(
      {
        secretOrKey: process.env.APP_KEY,
        jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      },
      async (token, done) => {
        try {
          return done(null, { id: token.sub });
        } catch (error) {
          done(error);
        }
      }
    )
  );

/**
 * Token validity duration in seconds.
 */
export const TOKEN_LIFESPAN = process.env.TOKEN_LIFESPAN
  ? parseInt(process.env.TOKEN_LIFESPAN)
  : 60 * 60;
