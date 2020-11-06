const { createCanvas, loadImage } = require("canvas");
const fs = require("fs");

function drawBoard(
  board_path,
  glyph_list,
  W,
  H,
  glyph_w,
  glyph_h,
  ready,
  fontfilename = "ipaexg.ttf"
) {
  board_width = (W + 1) * glyph_w;
  board_height = (H + 1) * glyph_h;

  var canvas = createCanvas(board_width, board_height);
  var ctx = canvas.getContext("2d");

  ctx.fillStyle = "#2f363d";
  ctx.fillRect(0, 0, board_width, board_height);

  ctx.fillStyle = "white";
  ctx.font = `${Math.floor(glyph_w / 2)}px bold serif`;

  [...Array(W + 1).keys()].forEach((x) => {
    c = String.fromCharCode(65 + x);
    var text = ctx.measureText(c);
    xx = Math.floor(x * glyph_w + glyph_w + glyph_w / 2 - text.width / 2);
    yy = Math.floor(glyph_h - glyph_w / 2);
    ctx.fillText(`${c}`, xx, yy);
  });
  [...Array(H + 1).keys()].forEach((y) => {
    c = `${y + 1}`;
    var text = ctx.measureText(c);
    xx = Math.floor(glyph_w / 2 - text.width / 2);
    yy = Math.floor(y * glyph_h + glyph_h + glyph_h - glyph_w / 2);
    ctx.fillText(`${c}`, xx, yy);
  });

  var cards = [];
  var i = 0;
  [...Array(H).keys()].forEach((y) => {
    [...Array(W).keys()].forEach((x) => {
      if (i < glyph_list.length && glyph_list[i] != "") {
        xx = x * glyph_w + glyph_w;
        yy = y * glyph_h + glyph_h;
        cards.push([xx, yy, glyph_list[i]]);
      } else cards.push([-1, -1, ""]);
      i += 1;
    });
  });

  Promise.all(
    cards.map((c) => {
      if (c[2] != "") {
        loadImage(c[2]).then((image) => {
          ctx.drawImage(
            image,
            0,
            0,
            glyph_w,
            glyph_h,
            c[0],
            c[1],
            glyph_w,
            glyph_h
          );
        });
      }
    })
  )
    .then((images) => {
      [...Array(W + 1).keys()].forEach((x) => {
        xx = x * glyph_w + glyph_w;
        ctx.beginPath();
        ctx.moveTo(xx, 0);
        ctx.lineTo(xx, board_height);
        ctx.strokeStyle = "gray";
        ctx.lineWidth = 2;
        ctx.stroke();
      });
      [...Array(H + 1).keys()].forEach((y) => {
        yy = y * glyph_h + glyph_h;
        ctx.beginPath();
        ctx.moveTo(0, yy);
        ctx.lineTo(board_width, yy);
        ctx.strokeStyle = "gray";
        ctx.lineWidth = 2;
        ctx.stroke();
      });
      fs.writeFileSync(board_path, canvas.toBuffer("image/png"));
    })
    .then(ready());
}

module.exports = drawBoard;
