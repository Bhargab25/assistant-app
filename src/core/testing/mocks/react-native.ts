// src/core/testing/mocks/react-native.ts

export const Platform = {
  OS: "android",
  select: (objs: any) => objs.android || objs.default,
};
