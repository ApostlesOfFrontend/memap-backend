export const getOriginalsS3Key = (
  userId: string,
  tripId: number,
  imageUuid: string
) => `originals/${userId}/${tripId}/${imageUuid}`;

export const getCompressedS3Key = (
  userId: string,
  tripId: number,
  imageUuid: string
) => `images/${userId}/${tripId}/${imageUuid}-compressed`;

export const getThumbnailS3Key = (
  userId: string,
  tripId: number,
  imageUuid: string
) => `images/${userId}/${tripId}/${imageUuid}-thumbnail`;
