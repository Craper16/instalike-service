import { RequestHandler } from 'express';
import { searchUsers } from '../services/search';

export const SearchUsers: RequestHandler = async (req, res, next) => {
  const { search_query } = req.query as { search_query: string };

  try {
    const searchUsersResponse = await searchUsers({
      searchQuery: search_query,
    });

    return res
      .status(searchUsersResponse?.status!)
      .json({ users: searchUsersResponse?.users });
  } catch (error) {
    next(error);
  }
};
