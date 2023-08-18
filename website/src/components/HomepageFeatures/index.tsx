import React from "react";
import clsx from "clsx";
import styles from "./styles.module.css";

type FeatureItem = {
  title: string;
  Svg: React.ComponentType<React.ComponentProps<"svg">>;
  description: JSX.Element;
};

const FeatureList: FeatureItem[] = [
  {
    title: "スマホに最適化されたUX",
    Svg: require("@site/static/img/undraw_docusaurus_tree.svg").default,
    description: (
      <>
        もはや大半のユーザはスマホでサイトを閲覧しています。Kifu for
        JSはスマホに最適化されたユーザエクスペリエンスを提供します。
      </>
    ),
  },
  {
    title: "カスタマイズ可能",
    Svg: require("@site/static/img/undraw_docusaurus_react.svg").default,
    description: (
      <>
        盤のレイアウトを崩さずに、表示したい大きさや領域にフィットさせることができます。また、盤面の状態を外部からコントロールできるAPI
        (mobx状態) が利用可能です。
      </>
    ),
  },
  {
    title: "設置は簡単",
    Svg: require("@site/static/img/undraw_docusaurus_mountain.svg").default,
    description: (
      <>
        タグをコピーしてあなたのサイトやブログに貼り付けるだけで、将棋再生盤を設置できます。必要なJSファイル等は信頼性の高いCDN上にホストされています。
      </>
    ),
  },
];

function Feature({ title, Svg, description }: FeatureItem) {
  return (
    <div className={clsx("col col--4")}>
      <div className="text--center">
        <Svg className={styles.featureSvg} role="img" />
      </div>
      <div className="text--center padding-horiz--md">
        <h3>{title}</h3>
        <p>{description}</p>
      </div>
    </div>
  );
}

export default function HomepageFeatures(): JSX.Element {
  return (
    <section className={styles.features}>
      <div className="container">
        <div className="row">
          {FeatureList.map((props, idx) => (
            <Feature key={idx} {...props} />
          ))}
        </div>
      </div>
    </section>
  );
}
