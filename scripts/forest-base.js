export function forestBase(rows, seed = 0) {
  return rows.map((row,y)=>[...row].map((token,x)=> {
    const edge = 96 + Math.round(Math.sin(x/17+seed)*5 + Math.sin(x/7-seed)*3);
    return token === 't' && y > edge ? '.' : token;
  }).join(''));
}
