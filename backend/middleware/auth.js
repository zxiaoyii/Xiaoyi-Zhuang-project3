const COOKIE = "u";

export function getUsername(req) {
  return req.signedCookies[COOKIE] || null;
}

export function setUserCookie(res, username) {
  res.cookie(COOKIE, username, {
    httpOnly: true,
    signed: true,
    maxAge: 7 * 24 * 60 * 60 * 1000,
    sameSite: "lax",
  });
}

export function clearUserCookie(res) {
  res.clearCookie(COOKIE, { sameSite: "lax" });
}

export function requireAuth(req, res, next) {
  const u = getUsername(req);
  if (!u) {
    res.status(401).json({ error: "Not logged in." });
    return;
  }
  req.user = u;
  next();
}
