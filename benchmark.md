# Benchmark

- 2023-09-18T01:26:02.322Z
- Node: v20.6.1
- V8: 11.3.244.8-node.14
- OS: linux
- Arch: x64

## HelloWorld

| typed-html | @kitajs/html | @kitajs/html -- v2 | faster                      |
| ---------- | ------------ | ------------------ | --------------------------- |
| 0.0296ms   | 0.0094ms     | 0.0047ms           | @kitajs/html -- v2,0.0047ms |
| 6.5537ms   | 3.4771ms     | 2.7688ms           | @kitajs/html -- v2,2.7688ms |
| 19.664ms   | 6.737ms      | 6.9112ms           | @kitajs/html,6.737ms        |

## MdnHomepage

| typed-html   | @kitajs/html | @kitajs/html -- v2 | faster                         |
| ------------ | ------------ | ------------------ | ------------------------------ |
| 5.0181ms     | 1.3923ms     | 1.0437ms           | @kitajs/html -- v2,1.0437ms    |
| 4014.2081ms  | 929.2162ms   | 948.129ms          | @kitajs/html,929.2162ms        |
| 41782.9947ms | 9507.1948ms  | 7969.7056ms        | @kitajs/html -- v2,7969.7056ms |

## ManyComponents

| typed-html  | @kitajs/html | @kitajs/html -- v2 | faster                         |
| ----------- | ------------ | ------------------ | ------------------------------ |
| 0.6975ms    | 0.2135ms     | 0.6666ms           | @kitajs/html,0.2135ms          |
| 502.0649ms  | 212.9411ms   | 202.1302ms         | @kitajs/html -- v2,202.1302ms  |
| 4738.8017ms | 2089.2906ms  | 1899.6726ms        | @kitajs/html -- v2,1899.6726ms |

## ManyProps

| typed-html  | @kitajs/html | @kitajs/html -- v2 | faster                         |
| ----------- | ------------ | ------------------ | ------------------------------ |
| 1.3655ms    | 0.2476ms     | 0.2425ms           | @kitajs/html -- v2,0.2425ms    |
| 968.6332ms  | 245.4568ms   | 217.3802ms         | @kitajs/html -- v2,217.3802ms  |
| 9483.8037ms | 2469.4932ms  | 2372.9959ms        | @kitajs/html -- v2,2372.9959ms |
