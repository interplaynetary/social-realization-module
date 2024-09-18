export const playerAction = async (apiKey, actionType, actionParams = []) => {
  const response = await fetch("http://localhost:3000/player-action", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      apiKey,
      actionType,
      actionParams,
    }),
  });
  return await response.json();
};
