export default function getRoomId(): string {
  return window.location.pathname.replace('/', '');
}
