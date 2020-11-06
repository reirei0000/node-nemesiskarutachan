const csv = require("csvtojson");
const draw_board = require("./board");

function shuffle(a) {
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

class IngressKaruta {
  constructor() {
    this._mondai = undefined;
    this._num = 1;
    this._W = 10;
    this._H = 5;
  }

  async init(ready) {
    this._cards = await csv().fromFile("resources/ingresskaruta.csv");
    var l = this._cards.length;
    this._narabi = [...Array(l).keys()].map((v) => v + 1);
    this._nokori = [...Array(l).keys()].map((v) => v + 1);
    this._narabi = shuffle(this._narabi);
    console.log(this._cards);
    console.log(l);
    console.log(this._nokori);
    console.log(this._narabi);

    ready();
  }

  next() {
    if (this._mondai !== undefined) {
      this._nokori = this._nokori.filter((n) => n !== this._mondai["no"]);

      this._narabi = this._narabi.map((n) => {
        if (n == this._mondai["no"]) return -1;
        else return n;
      });
      this._num += 1;
    }

    var mondai_no = this._nokori[
      Math.floor(Math.random() * this._nokori.length)
    ];
    var n = this._narabi.indexOf(mondai_no);
    var ei = String.fromCharCode((n % this._W) + 65);
    var suu = Math.floor(n / this._W) + 1;
    var ichi = `${ei}${suu}`;

    var card = this._cards.filter((c) => c["no"] == mondai_no)[0];
    console.log(card);
    var moji = card["moji"];
    var yomi = card["yomi"];
    var mondai_str = `「${moji}」 ${yomi}`;

    console.log(`mondai_str=${ichi}/${mondai_no}/${mondai_str}`);

    this._mondai = {
      num: this._num,
      no: mondai_no,
      name: mondai_str,
      location: ichi,
    };
    return this._mondai;
  }

  mondai() {
    return this._mondai;
  }

  seikai() {
    var card = this._cards.filter((c) => c["no"] == this._mondai["no"])[0][
      "filename"
    ];
    return `resources/${card}.jpg`;
  }

  draw(output_path, ready) {
    draw_board(
      output_path,
      this._narabi.map((v) => {
        if (v > 0) {
          return (
            "resources/" +
            this._cards.filter((c) => c["no"] == v)[0]["filename"] +
            ".jpg"
          );
        } else return "";
      }),
      this._W,
      this._H,
      128,
      192,
      function () {
        ready();
      }
    );
  }
}

module.exports = IngressKaruta;
