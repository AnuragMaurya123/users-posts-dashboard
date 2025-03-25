declare global {
  let _mongoose: {
    conn: import('mongoose').Connection | null;
    promise: Promise<import('mongoose').Connection> | null;
  };
}

export {};
