import { Readable } from 'stream';
import { User } from '../models/user';
import { bucket } from '..';
import { Post } from '../models/post';
import { Comment } from '../models/comment';
import { Like } from '../models/like';
import { s3 } from '../routes/auth';

export const getPost = async ({ postId }: { postId: string }) => {
  try {
    const post = await Post.findById(postId);

    if (!post) {
      return {
        message: "Post doesn't exist",
        name: 'Not Found',
        status: 404,
      };
    }

    const user = await User.findById(post.userId);

    if (!user) {
      return {
        message: "User doesn't exist",
        name: 'Not Found',
        status: 404,
      };
    }

    const comments = await Comment.paginate({ postId: post._id });
    const likes = await Like.paginate({ postId: post._id });

    const commentsTotal = comments.totalDocs;
    const likesTotal = likes.totalDocs;

    return { status: 200, post: post, user, commentsTotal, likesTotal };
  } catch (error) {
    console.error(error);
  }
};

export const post = async ({
  posts,
  userId,
  caption,
}: {
  posts: Express.Multer.File[];
  userId: string;
  caption: string;
}) => {
  try {
    const user = await User.findById(userId);
    if (!user) {
      return {
        message: "User doesn't exist",
        name: 'Not Found',
        status: 404,
      };
    }

    if (!posts || posts.length == 0) {
      return {
        message: 'No posts provided',
        name: 'Not provided',
        status: 409,
      };
    }

    const uploadPromise = posts.map(async (post) => {
      return await s3
        .upload({
          Bucket: process.env.AWS_S3_BUCKET_NAME,
          Key: post.originalname,
          Body: post.buffer,
          ContentType: 'image/jpeg',
          ACL: 'public-read-write',
        })
        .promise()
        .then((data) => data.Location)
        .catch((error) => {
          return {
            message: error.message,
            status: 403,
            name: error.name,
          };
        });
    });

    const postsResponse = await Promise.all(uploadPromise);

    const post = new Post({
      caption: caption ?? null,
      post: postsResponse,
      userId: user._id,
    });

    const result = await post.save();

    return { status: 201, post: result, user, commentsTotal: 0, likesTotal: 0 };
  } catch (error) {
    console.error(error);
  }
};

export const editPost = async ({
  userId,
  postId,
  caption,
  posts,
}: {
  userId: string;
  postId: string;
  posts: Express.Multer.File[];
  caption: string;
}) => {
  try {
    const user = await User.findById(userId);
    const post = await Post.findById(postId);

    if (!user) {
      return {
        message: "User doesn't exist",
        name: 'Not Found',
        status: 404,
      };
    }

    if (!post) {
      return {
        message: "Post doesn't exist",
        name: 'Not Found',
        status: 404,
      };
    }

    if (post.userId.toString() !== user._id.toString()) {
      return {
        message: 'Unauthorized',
        name: 'Unauthorized',
        status: 401,
      };
    }

    if (!posts || posts.length == 0) {
      return {
        message: 'No posts provided',
        name: 'Not provided',
        status: 409,
      };
    }

    const uploadPromise = posts.map(async (post) => {
      return await s3
        .upload({
          Bucket: process.env.AWS_S3_BUCKET_NAME,
          Key: post.originalname,
          Body: post.buffer,
          ContentType: 'image/jpeg',
          ACL: 'public-read-write',
        })
        .promise()
        .then((data) => {
          return data.Location;
        })
        .catch((error) => {
          return {
            message: error.message,
            status: 403,
            name: error.name,
          };
        });
    });

    const postsResponse = await Promise.all(uploadPromise);

    post.post = postsResponse as string[];
    post.caption = caption;

    const result = await post.save();

    const comments = await Comment.paginate({ postId: post._id });
    const likes = await Like.paginate({ postId: post._id });

    const commentsTotal = comments.totalDocs;
    const likesTotal = likes.totalDocs;

    return { status: 200, post: result, user, commentsTotal, likesTotal };
  } catch (error) {
    console.error(error);
  }
};

export const deletePost = async ({
  userId,
  postId,
}: {
  postId: string;
  userId: string;
}) => {
  try {
    const user = await User.findById(userId);
    const post = await Post.findByIdAndDelete(postId);

    if (!user) {
      return {
        message: "User doesn't exist",
        name: 'Not Found',
        status: 404,
      };
    }

    if (!post) {
      return {
        message: "Post doesn't exist",
        name: 'Not Found',
        status: 404,
      };
    }

    if (post.userId.toString() !== user._id.toString()) {
      return {
        message: 'Unauthorized',
        name: 'Unauthorized',
        status: 401,
      };
    }

    const comments = await Comment.paginate({ postId: post._id });
    const likes = await Like.paginate({ postId: post._id });

    const commentsTotal = comments.totalDocs;
    const likesTotal = likes.totalDocs;

    return { status: 200, post, user, commentsTotal, likesTotal };
  } catch (error) {
    console.error(error);
  }
};
