import joi from 'joi';

export const postOrEditCommentValidations = joi.object().keys({
  comment: joi.string().required().max(50),
});
