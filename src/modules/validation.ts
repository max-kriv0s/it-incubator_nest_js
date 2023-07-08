import { validateOrReject } from 'class-validator';

export const validateOrRejectModel = async (
  model: any,
  classConstructor: { new (): any },
) => {
  if (model instanceof classConstructor === false) {
    throw new Error('Incorrect input data');
  }
  try {
    await validateOrReject(model);
  } catch (error) {
    throw new Error(error);
  }
};
