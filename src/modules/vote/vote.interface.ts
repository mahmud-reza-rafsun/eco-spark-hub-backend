export interface IVoteRequest {
    ideaId: string;
    type: 'UPVOTE' | 'DOWNVOTE';
}