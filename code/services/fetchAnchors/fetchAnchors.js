/**
 * @typedef {object} anchors
 * @property {string} name
 * @property {number} x_pos
 * @property {number} y_pos
 * @property {string} view_id
 */

 /**
 * @typedef {object} fetchAnchorsParams
 * @property {string} cbQuery
 * @property {number} pageSize
 * @property {number} pageNum
 */

 /**
 * Fetches a list of items from the "anchors" collection
 * @param {{ params: fetchAnchorsParams | anchors }} req
 * @param {fetchAnchorsParams | anchors} req.params
 * @param {CbServer.Resp} resp
 */
function fetchAnchors(req, resp) {
  log(req)  
  ClearBlade.init({ request: req });

  var cbQuery = req.params.cbQuery
  var pageSize = req.params.pageSize || 0
  var pageNum = req.params.pageNum || 0
  delete req.params.cbQuery
  delete req.params.pageSize
  delete req.params.pageNum

  var query = ClearBlade.Query();
  // allows for complex queries generated from the filter widget
  if (cbQuery) {
    query.query = cbQuery
  } else {
    // allows basic filtering on any column
    ["name", "x_pos", "y_pos", "view_id"].forEach(function(name) {
      value = req.params[name];
      if(value !== undefined) {
        query.equalTo(name, value);
      }
    })
    query.setPage(pageSize, pageNum);
  }

  var fetchedData;
  var count

  var col = ClearBlade.Collection({ collectionName: "anchors" });
  col.fetch(query, function (err, data) {
    fetchedData = data
    log(data)
    if (err) {
      resp.error(data)
    } else {
      // TOTAL from fetch is just DATA.length, replace it with total that match query
      if(fetchedData && count !== undefined) {
        fetchedData.TOTAL = count
        resp.success(data)
      }
    }
  });

  col.count(query, function (err, data) {
    count = data.count
    if (err) {
      resp.error(data)
    } else {
      if(fetchedData && count !== undefined) {
        fetchedData.TOTAL = count
        resp.success(fetchedData)
      }
    }
  })
}
