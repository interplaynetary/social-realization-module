# Playnet KPI Options for Each Cycle
https://github.com/UMAprotocol/launch-lsp

## Metric
- The spread between potential and realized value.
    - We bring our off-chain protocol on the graph: https://thegraph.com/blog/the-graph-off-chain-data-web3-data-pipelines/

## KPI option parameters
Expiration date: ${end-of-cycle} (The timestamp for when the options expire.)

The payout function: Rewards more, the less the spread.
(The rewards and the associated payout for each KPI option token.)

The collateral token: InvestorPoints
(The reward token. Please note that tokens will need to be approved by governance. If not part of the approved list, please reach out to the team to add the token.)

The name of the KPI option token: `Playnet Success Cycle ${cyclenumber}`

## Deploy the contract
The deployment tutorial and launch-lsp repo can be used to deploy the KPI option contract.

## Mint the KPI options
UMAverse is a user interface created to assist teams in minting tokens for newly created KPI options. A minter deposits collateral into a KPI option contract and then receives an equal number of long and short tokens in return. The long token is the "KPI option" that should be distributed/sold to KPI option recipients. The short token is simply tokenized over-collateralization, or the (required minting collateral amount - the settlement value of the KPI option).

 If your KPI option is not displayed on UMAverse, please reach out on Discord to get it added.

## Redeeming the options
UMAverse, the UI used to mint options, can also be used by KPI option participants to redeem their tokens for collateral.

Options will be available to redeem after the expiration timestamp of the contract and a price proposal goes through the Optimistic Oracle liveness period. 


## Why would an investor buy a Success Token?
Success tokens provide investors the kind of risk and upside exposure potential they are looking for without forcing a project or DAO to sell tokens at a discount. Investors are receiving compensation for capital lock-up time in the form of a call option instead of a token discount. This provides a strong incentive for investors to participate in the project's growth, while also giving the investor a large amount of upside. This is a mutually beneficial situation for both parties involved, where the investor is only specially compensated if the project succeeds.

Success tokens allow more flexibility for investors to negotiate terms with a DAO along with an increased likeliness of the deal being well received by decentralized communities.

## Why should DAOs use Success Tokens?
Selling upside optionality to the success token holder in return for downside protection is generally a desirable outcome for DAOs that are already extremely exposed to the price of their own token.

Success tokens allow DAOs to borrow funds without the risk of liquidation and utilizes their native token which dominates most of their treasury. In contrast, yield dollars and CDPs require borrowers to maintain a certain collateral ratio or face liquidation. Maintaining healthy collateralization ratios could be very detrimental DAO if the price of its native token drops aggressively and the DAO is forced to put a significant amount of its treasury at risk.

Success tokens can give the DAO access to VC capital and expertise which helps projects succeed without selling their tokens at a discount.