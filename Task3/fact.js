let ans = 1n;
let num = +prompt("Enter a number to find its factorial:");
for(let i = 2; i <= num; i++){
    ans *= BigInt(i);
}

alert(ans);