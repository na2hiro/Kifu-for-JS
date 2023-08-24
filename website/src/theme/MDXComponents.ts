import MDXComponents from "@theme-original/MDXComponents";
import { KifuLite } from "kifu-for-js";
import KifuForEachMethod from "@site/src/components/_KifuForEachMethod";
import { Example1, Example2 } from "@site/src/components/_ExampleKifu";

export default {
  // Re-use the default mapping
  ...MDXComponents,
  KifuLite,
  KifuForEachMethod,
  Example1,
  Example2,
};
