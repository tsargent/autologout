export default (seconds) => {
  const d = new Date(0);
  d.setUTCSeconds(seconds);
  return d.toTimeString();
}
