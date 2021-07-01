export default function getBucketName(kind) {
  switch (kind) {
    case 'event':
      return 'events-vtt-bzh';
    default:
      return null;
  }
}
