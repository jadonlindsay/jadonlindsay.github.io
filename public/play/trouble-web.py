# Runs before trouble-gamefile.py on the play page, in the same namespace. The game file itself is
# not edited: as it loads, the page swaps its three input() calls for _web_input(), defined here.
# _web_input reads Red's answers from the page's text box, and answers for Green, Yellow and Blue
# itself, so one person can play against three computer players.
import sys, types, asyncio
import js

# The game opens its rules file with webbrowser.open(); here the rules are printed instead.
_wb = types.ModuleType("webbrowser")
def _open(path, *args, **kwargs):
    with open(path) as f:
        print(f.read())
    return True
_wb.open = _open
sys.modules["webbrowser"] = _wb

# Computer players: letter and start square, matching the game's own numbers.
_BOTS = {"Green": ("G", 7), "Yellow": ("Y", 14), "Blue": ("B", 21)}
_plan = {}


def _choose(g, letter, start):
    """The computer's move for this roll, checked against the game's rules so the game never
    rejects it: capture if possible, otherwise bring a piece out on a 6 or move a piece into the
    finish area, otherwise move the piece that's furthest along."""
    roll, board = g["dice_val"], g["board"]
    pieces, final, home = g[letter + "_pieces"], g[letter + "_final"], g["H" + letter + "_pieces"]
    own = lambda v: v != "oo" and v[0] == letter
    options = []
    if roll == 6 and home and not own(board[start]):
        options.append((70 if board[start] != "oo" else 30, "a", None))
    for p, d in pieces.items():
        if d == 31:
            continue
        if d >= 28:
            a = d + roll
            if a <= 31 and final[a - 28] == "oo":
                options.append((10 + d, "m", p))
            continue
        if d >= 22:
            a = d + roll - 28
            if 0 <= a <= 3:
                if final[a] == "oo":
                    options.append((50 + d, "m", p))
                continue
            if a > 3:
                continue
        pos = (d + roll + start) % 28
        if own(board[pos]):
            continue
        options.append(((60 if board[pos] != "oo" else 0) + d, "m", p))
    if not options:
        return "s", None
    best = max(options, key=lambda o: o[0])
    return best[1], best[2]


def _bot_answer(prompt, g):
    letter, start = _BOTS[g["color"]]
    if prompt.startswith("Press"):
        _plan.clear()
        return ""
    if prompt.startswith("What"):
        if _plan.get("asked"):  # never expected; skip rather than ask forever
            return "s"
        _plan["asked"] = True
        action, piece = _choose(g, letter, start)
        _plan["piece"] = piece
        return action
    if prompt.startswith("Which"):
        piece = _plan.pop("piece", None)
        return piece or next(iter(g[letter + "_pieces"]), "")
    return ""


async def _web_input(prompt=""):
    print(prompt, end="")
    sys.stdout.flush()
    g = globals()
    if g.get("color") in _BOTS:
        await asyncio.sleep(0.25 if prompt.startswith("Press") else 0.55)
        answer = _bot_answer(prompt, g)
    else:
        answer = str(await js.troubleAsk(prompt))
    print(answer)
    return answer
