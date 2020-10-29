import passport from "passport";
import { Strategy as JwtStrategy, ExtractJwt } from "passport-jwt";
import { Strategy as LocalStrategy } from "passport-local";
import { UnauthorizedError } from "./errors";
import User, { IUser } from "./models/User";

/**
 * Token validity duration in seconds. Defaults to 1h.
 */
export let TOKEN_LIFESPAN = 60 * 60; // 1h

/**
 * Refresh token validity duration in seconds. Defaults to 30 days.
 */
export let TOKEN_REFRESH_LIFESPAN = 30 * 24 * 60 * 60; // 30 days

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
  if (process.env.TOKEN_REFRESH_LIFESPAN) {
    TOKEN_REFRESH_LIFESPAN = parseInt(process.env.TOKEN_REFRESH_LIFESPAN);
  }

  // standard jwt
  passport.use(
    "jwt",
    new JwtStrategy(
      {
        secretOrKey: process.env.APP_KEY,
        jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      },
      async (token, done) => {
        // invalid JWT
        if (token.aud != process.env.APP_URL) {
          return done(new UnauthorizedError("Invalid token"));
        }

        return done(null, { _id: token.sub });
      }
    )
  );

  // refresh jwt
  passport.use(
    "jwt-refresh",
    new JwtStrategy(
      {
        secretOrKey: process.env.APP_KEY,
        jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      },
      async (token, done) => {
        // invalid JWT
        if (!token.hash) {
          return done(new UnauthorizedError("Invalid refresh token"));
        }

        return done(null, { _id: token.sub });
      }
    )
  );
};

/**
 * Adds the local strategy to passport and define user serialization for
 * session use. The strategy checks that given credentials are valid.
 */
export const setupPassportLocalStrategy = () => {
  passport.use(
    "local",
    new LocalStrategy(
      {
        usernameField: "email",
        session: true,
      },
      (username, password, done) => {
        User.findOne({ email: username })
          .select("password")
          .exec(async (err, user) => {
            // db error
            if (err) {
              return done(err);
            }

            // no user found
            if (!user) {
              return done(null, false);
            }

            // incorrect password
            if (!(await user.verifyPassword(password))) {
              return done(null, false);
            }

            // user found
            return done(null, user);
          });
      }
    )
  );

  // Configure Passport authenticated session persistence.
  //
  // In order to restore authentication state across HTTP requests, Passport needs
  // to serialize users into and deserialize users out of the session.  The
  // typical implementation of this is as simple as supplying the user ID when
  // serializing, and querying the user record by ID from the database when
  // deserializing.
  passport.serializeUser((user, cb) => cb(null, (user as IUser)._id));
  passport.deserializeUser((id, cb) => {
    User.findById(id, (err, user) => {
      if (err) {
        return cb(err);
      }
      cb(null, user);
    });
  });
};
