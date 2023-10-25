export class PostCreatedEvent {
  constructor(
    public readonly postTitle: string,
    public readonly blogId: number,
    public readonly blogName: string,
  ) {}
}
