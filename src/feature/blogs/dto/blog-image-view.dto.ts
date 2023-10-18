export class PhotoSizeView {
  readonly url: string;
  readonly width: number;
  readonly height: number;
  readonly fileSize: number;
}

export class BlogImageView {
  wallpaper: PhotoSizeView | null;
  main: PhotoSizeView[];
}
