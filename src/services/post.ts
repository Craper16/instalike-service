import { Readable } from 'stream';
import { User } from '../models/user';
import { bucket } from '..';
import { Post } from '../models/post';

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

    return { status: 200, post: post, user };
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
      const readableStream = new Readable();
      readableStream.push(post.buffer);
      readableStream.push(null);

      const uploadStream = bucket.openUploadStream(post.filename);
      const id = uploadStream.id;

      readableStream.pipe(uploadStream);

      const uploadPromise = new Promise((resolve, reject) => {
        uploadStream.on('error', () => {
          reject({
            message: 'Could not upload file to S3',
            status: 403,
            name: 'Upload Failed',
          });
        });

        uploadStream.on('finish', () => {
          resolve(() => {});
        });
      });

      await uploadPromise;

      return `http://192.168.1.113:5051/file/${id}`;
    });

    const postsResponse = await Promise.all(uploadPromise);

    const post = new Post({
      caption: caption ?? null,
      post: postsResponse,
      userId: user._id,
    });

    const result = await post.save();

    return { status: 201, post: result, user };
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
      const readableStream = new Readable();
      readableStream.push(post.buffer);
      readableStream.push(null);

      const uploadStream = bucket.openUploadStream(post.filename);
      const id = uploadStream.id;

      readableStream.pipe(uploadStream);

      const uploadPromise = new Promise((resolve, reject) => {
        uploadStream.on('error', () => {
          reject({
            message: 'Could not upload file to S3',
            status: 403,
            name: 'Upload Failed',
          });
        });

        uploadStream.on('finish', () => {
          resolve(() => {});
        });
      });

      await uploadPromise;

      return `http://192.168.1.113:5051/file/${id}`;
    });

    const postsResponse = await Promise.all(uploadPromise);

    post.post = postsResponse;
    post.caption = caption;

    const result = await post.save();

    return { status: 200, post: result, user };
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

    const result = await Post.findByIdAndDelete(post._id);

    return { status: 200, post: result, user };
  } catch (error) {
    console.error(error);
  }
};
