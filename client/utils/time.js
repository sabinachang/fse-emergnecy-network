export default function timeToNow(time) {
  const now = new Date();
  const diff = (now - time) / 1000 / 60;
  if (diff > 60) {
    return `${Math.ceil(diff / 60)}h`;
  }
  return `${Math.ceil(diff)}m`;
}
