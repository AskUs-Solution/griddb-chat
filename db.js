const griddb = require("griddb_node");

const createContainer = async (store) => {
  let container = await store.getContainer(containerName);
  if (container === null) {
    try {
      const schema = new griddb.ContainerInfo({
        name: containerName,
        columnInfoList: [
          ["timestamp", griddb.Type.TIMESTAMP],
          ["freeMemPercentage", griddb.Type.DOUBLE],
        ],
        type: griddb.ContainerType.TIME_SERIES,
        rowKey: true,
      });
      container = await store.putContainer(schema, false);
      return {
        putRow: putRow(container),
        getLatestRows: getLatestRows(container),
      };
    } catch (err) {
      console.log(err);
    }
  }
};

const connect = async () => {
  const factory = griddb.StoreFactory.getInstance();
  createContainer(factory);
  return factory.getStore({
    notificationMember: "griddb:10001",
    clusterName: "defaultCluster",
    username: "admin",
    password: "admin",
  });
};

const containerName = "FreeMemoryPercentage";
const schema = new griddb.ContainerInfo({
  name: containerName,
  columnInfoList: [
    ["timestamp", griddb.Type.TIMESTAMP],
    ["freeMemPercentage", griddb.Type.DOUBLE],
  ],
  type: griddb.ContainerType.TIME_SERIES,
  rowKey: true,
});
// const container = await store.putContainer(schema, false);

const putRow = (container) => async (val) => {
  try {
    const p = 1000;
    const now = new Date();
    const time = new Date(Math.round(now.getTime() / p) * p);
    await container.put([time, val]);
  } catch (err) {
    console.log(err);
  }
};

// const getLatestRows = (container) => async () => {
//   try {
//     const query = container.query(
//       "select * where timestamp > TIMESTAMPADD(MINUTES, NOW(), -5)"
//     );
//     const rowset = await query.fetch();
//     const data = [];
//     while (rowset.hasNext()) {
//       data.push(rowset.next());
//     }
//     return data;
//   } catch (err) {
//     console.log(err);
//   }
// };
module.exports = { connect };
