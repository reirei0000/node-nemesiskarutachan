class Score {
  constructor() {
    this._log = [];
  }

  succ(mondai_no) {
    return this._log.filter((log) => {
      return log["mondai_no"] === mondai_no && log["succ"];
    });
  }

  add(uid, name, mondai_no, succ) {
    if (
      this._log.filter(
        (log) =>
          log["uid"] === uid && log["mondai_no"] === mondai_no && log["succ"]
      ).length > 0
    )
      return;

    this._log.push({
      uid: uid,
      name: name,
      mondai_no: mondai_no,
      succ: succ,
      time: Date.now(),
    });
  }

  log() {
    return this._log;
  }

  total() {
    var users = {};
    this._log.map((log) => {
      users[log["uid"]] = { uid: log["uid"], name: log["name"], score: 0 };
    });

    var mondai_no = 0;
    var sub_total = [];
    this._log.map((log) => {
      if (log["mondai_no"] != mondai_no) {
        sub_total.map((uid) => users[uid]["score"]++);
        mondai_no = log["mondai_no"];
        sub_total = [];
      }
      if (
        sub_total.length < 1 &&
        !sub_total.includes(log["uid"]) &&
        log["succ"]
      )
        sub_total.push(log["uid"]);
    });
    sub_total.map((uid) => users[uid]["score"]++);

    var scores = Object.keys(users)
      .map((k) => users[k])
      .sort((u) => u["score"] - u["score"]);

    return scores;
  }
}

module.exports = Score;
