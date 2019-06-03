export default (
  route: (
    req: Express.Request,
    res: Express.Response,
    next?: Function
  ) => Promise<any>
) => async (req: Express.Request, res: Express.Response, next?: Function) => {
  try {
    await route(req, res, next);
  } catch (error) {
    next(error);
  }
};
