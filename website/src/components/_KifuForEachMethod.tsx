import CodeBlock from "@theme/CodeBlock";
import Tabs from "@theme/Tabs";
import TabItem from "@theme/TabItem";
import React from "react";
import { KifuLite } from "kifu-for-js";
import { IOptions } from "kifu-for-js/src/common/stores/KifuStore";

// e.g. data-reverse is confusing to be required with nested usages like data-reverse-name="player"
const attributesToDedup = ["reverse"];

export const optionsToAttribute = (
  options: IOptions & { kifu_?: IOptions["kifu"] }
) => {
  function optionsToAttributeMap(
    options: IOptions,
    props = {},
    prefices: string[] = []
  ) {
    for (let key in options) {
      const v = options[key];
      if (key === "kifu_") key = "kifu";
      if (Array.isArray(v) || v === null) {
        props[`${[...prefices, key].join("-")}`] = JSON.stringify(v);
      } else if (typeof v === "object") {
        if (!attributesToDedup.includes(key)) {
          props[`${[...prefices, key].join("-")}`] = true;
        }
        optionsToAttributeMap(v, props, [...prefices, key]);
      } else {
        props[`${[...prefices, key].join("-")}`] = v;
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
export const optionsToProps = (
  options: IOptions & { kifu_?: IOptions["kifu"] }
) => {
  function optionsToAttributeMap(
    options: IOptions,
    props = {},
    prefices: string[] = []
  ) {
    for (let key in options) {
      const v = options[key];
      if (key === "kifu_") key = "kifu"; // force kifu attribute
      props[`${[...prefices, key].join("-")}`] = v;
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

const KifuExampleComponent = ({
  suppressPreview = false,
  children,
  kifu,
  kifu_,
  ...props
}) => {
  const textContent = kifu_
    ? ""
    : kifu || addNewLinesOrEmpty(flattenMdxParsedChildren(children));
  return (
    <>
      {!suppressPreview && (
        <KifuLite {...{ ...props, children: kifu || kifu_ || children }} />
      )}
      <Tabs groupId="display-method">
        <TabItem value="markup" label="タグ方式" default>
          <CodeBlock language="html">
            &lt;script type="text/kifu"
            {optionsToAttribute({ ...(kifu_ ? { kifu_ } : {}), ...props })}
            &gt;
            {textContent}
            &lt;/script&gt;
          </CodeBlock>
        </TabItem>
        <TabItem value="javascript" label="JavaScript関数方式">
          <CodeBlock language="html">
            {`<div id="board-1"></div>
<script>
  KifuForJS.load(${JSON.stringify(
    { kifu: kifu_ || kifu || flattenMdxParsedChildren(children), ...props },
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
  return <KifuLite${optionsToProps({
    ...(kifu_ ? { kifu_ } : {}),
    ...props,
  })}>${
              textContent.endsWith("\n") ? textContent + "  " : textContent
            }</KifuLite>
}`}
          </CodeBlock>
        </TabItem>
      </Tabs>
    </>
  );
};
export default KifuExampleComponent;

function addNewLinesOrEmpty(text: string | undefined) {
  if (!text) return "";
  return "\n" + text + "\n";
}
