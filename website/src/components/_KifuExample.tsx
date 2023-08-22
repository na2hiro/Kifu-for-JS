import CodeBlock from "@theme/CodeBlock";
import Tabs from "@theme/Tabs";
import TabItem from "@theme/TabItem";
import React from "react";
import { KifuLite } from "kifu-for-js";
import { IOptions } from "kifu-for-js/src/common/stores/KifuStore";

export const optionsToAttribute = (options: IOptions) => {
  function optionsToAttributeMap(
    options: IOptions,
    props = {},
    prefices: string[] = []
  ) {
    for (let key in options) {
      if (Array.isArray(options[key])) {
        props[`${[...prefices, key].join("-")}`] = JSON.stringify(options[key]);
      } else if (typeof options[key] === "object") {
        props[`${[...prefices, key].join("-")}`] = true;
        optionsToAttributeMap(options[key], props, [...prefices, key]);
      } else {
        props[`${[...prefices, key].join("-")}`] = options[key];
      }
    }

    return props;
  }

  return Object.entries(optionsToAttributeMap(options))
    .map(
      ([key, value]) =>
        ` data-${key}` +
        (value === "true" || value === true ? "" : `="${value}"`)
    )
    .join("");
};
export const optionsToProps = (options: IOptions) => {
  function optionsToAttributeMap(
    options: IOptions,
    props = {},
    prefices: string[] = []
  ) {
    for (let key in options) {
      props[`${[...prefices, key].join("-")}`] = options[key];
    }

    return props;
  }

  return Object.entries(optionsToAttributeMap(options))
    .map(
      ([key, value]) =>
        ` ${key}` +
        (value === "true" || value === true
          ? ""
          : `={${JSON.stringify(value)}}`)
    )
    .join("");
};

function flattenMdxParsedChildren(children) {
  if (!children) return children;
  if (typeof children === "string") return children;
  if (Array.isArray(children))
    return children.map(flattenMdxParsedChildren).join("\n\n");
  if (children.props) return flattenMdxParsedChildren(children.props.children);
  return "";
}

const KifuExampleComponent = ({ children, kifu, ...props }) => {
  return (
    <>
      <KifuLite {...{ ...props, children: kifu || children }} />
      <Tabs groupId="display-method">
        <TabItem value="markup" label="マークアップ方式" default>
          <CodeBlock language="html">
            &lt;script type="text/kifu"{optionsToAttribute(props)}&gt;
            {kifu || "\n" + flattenMdxParsedChildren(children) + "\n"}
            &lt;/script&gt;
          </CodeBlock>
        </TabItem>
        <TabItem value="javascript" label="JavaScript関数方式">
          <CodeBlock language="html">
            {`
<div id="board-1"></div>
<script>
  KifuForJS.load(${JSON.stringify(
    { kifu: kifu || flattenMdxParsedChildren(children), ...props },
    null,
    2
  )
    .split("\n")
    .join("\n  ")}, "board-1");
</script>
`}
          </CodeBlock>
        </TabItem>
        <TabItem value="react" label="Reactコンポーネント方式">
          <CodeBlock language="jsx">
            {`import {KifuLite} from "kifu-for-js";

export const MyComponent = () => {
  return <KifuLite${optionsToProps(props)}>${
              kifu || "\n" + flattenMdxParsedChildren(children) + "\n"
            }  </KifuLite>
}`}
          </CodeBlock>
        </TabItem>
      </Tabs>
    </>
  );
};
export default KifuExampleComponent;
