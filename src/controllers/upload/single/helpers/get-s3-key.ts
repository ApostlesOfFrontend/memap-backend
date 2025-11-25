export const getOriginalsS3Key = (
  userId: string,
  tripId: number,
  imageUuid: string
) => `originals/${userId}/${tripId}/${imageUuid}`;

export const getFullResS3Key = (
  userId: string,
  tripId: number,
  imageUuid: string
) => `images/full/${userId}/${tripId}/${imageUuid}`;

export const getThumbnailS3Key = (
  userId: string,
  tripId: number,
  imageUuid: string
) => `images/thumbnail/${userId}/${tripId}/${imageUuid}`;
