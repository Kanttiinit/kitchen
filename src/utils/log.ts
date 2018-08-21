import * as ua from 'universal-analytics';

const client = ua(process.env.UA_ID);

export const log = (
  category: string,
  action: string,
  label?: string,
  value?: string | number
) => {
  client.event(category, action, label, value);
};
