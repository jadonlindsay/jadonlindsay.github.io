## global / initial variables
import webbrowser as webbrowser
import random


welcome=open("welcome_file.txt", "w")
welcome.write("Welcome to a game of Trouble\n")
welcome.write("\n")
welcome.write("How to play:\n")
welcome.write("\n")
welcome.write('Players will begin by "rolling" a dice.\n')
welcome.write("\n")
welcome.write("Players may move 1 of their 4 pieces out of their home onto their designated start space only when the die lands on 6.\n")
welcome.write("\n")
welcome.write("Getting a 6 at any point in the game also allows the player to take another turn, even if the player cannot move any of their pieces\n")
welcome.write("(as they cannot land on any of their own pieces).\n")
welcome.write("\n")
welcome.write("Players may also move another one of their pieces onto the board even if there is one or more of theirs in play already.\n")
welcome.write('\n')
welcome.write('''If another player's piece is occupying their "start" space they can send that piece home and advance their piece to the start space\n''')
welcome.write('belonging to the play that just rolled a 6. Players cannot do so when one of their own pieces is occupying their "start" space.\n')
welcome.write("\n")
welcome.write("Pieces move around the track. Players can send opponents' pieces back to the start by landing on them.\n")
welcome.write('\n')
welcome.write('Pieces are protected from capture after arriving in the final four slots of the finish area.\n')
welcome.write('\n')
welcome.write('The winner is the first to have all 4 of their pieces in the finish area\n')
welcome.write('\n')
welcome.write("INPUTS for the game are:\n")
welcome.write("------------------------\n")
welcome.write("a:add piece == moves a piece out of home after rolling a 6\n")
welcome.write('\n')
welcome.write('m:move piece == moves a piece depending on their following input\n')
welcome.write('\n')
welcome.write('s:skip  == skips their turn if nothing can be done\n')
welcome.write('R1, R2, R3, R4, B1, B2, B3, B4, G1, G2, G3, G4, Y1, Y2, Y3, Y4 == select a piece only displayed in dictionary\n')
welcome.write('\n')
welcome.write('e:Exit game == exits the game \n')
welcome.close()
webbrowser.open("welcome_file.txt")










R_pieces = {} ## { piece number : total distance moved}
B_pieces = {}
G_pieces = {}
Y_pieces = {}


### List of the pieces that are in the home
HR_pieces= ['R1','R2','R3','R4']
HB_pieces= ['B1','B2','B3','B4']
HG_pieces= ['G1','G2','G3','G4']
HY_pieces= ['Y1','Y2','Y3','Y4']




board = ['oo', 'oo', 'oo', 'oo', 'oo', 'oo', 'oo', 'oo', 'oo', 'oo', 'oo', 'oo', 'oo', 'oo', 'oo', 'oo', 'oo', 'oo', 'oo', 'oo', 'oo', 'oo', 'oo', 'oo', 'oo', 'oo', 'oo', 'oo'] ## 28 spaces
R_final = ['oo', 'oo', 'oo', 'oo'] ## safe places for color, ending zone
B_final = ['oo', 'oo', 'oo', 'oo']
G_final = ['oo', 'oo', 'oo', 'oo']
Y_final = ['oo', 'oo', 'oo', 'oo']






def print_board():
    '''This code references the variables board, the four final spot variables, and the home spot variables and uses them to print out a visualization of what the board looks like'''
    num_board = ['rs','x1','x2','x3','x4','x5','x6','gs','x8','x9','10','11','12','13','ys','15','16','17','18','19','20','bs','22','23','24','25','26','27']
    board_image = [
        '    Y1     ----------------------------------     B1       ',
        '   Y2    /     15    16    17    18   19     \\     B2     ',
        '  Y3    /    ys                         20    \\     B3    ',
        ' Y4    /   13                             bs   \\     B4   ',
        '      |  12    y1                    b1     22  |          ',
        '      |          y2               b2            |          ',
        '      |  11        y3           b3          23  |          ',
        '      |              y4       b4                |          ',
        '      |  10                                 24  |          ',
        '      |              g4       r4                |          ',
        '      |  x9        g3            r3         25  |          ',
        '      |          g2                r2           |          ',
        '      |  x8    g1                    r1     26  |          ',
        ' G4    \\   gs                             27   /      R4  ',
        '  G3    \\    x6                          rs   /      R3   ',
        '   G2    \\     x5    x4    x3    x2    x1    /      R2    ',
        '    G1     ---------------------------------       R1      '
    ]


    ### Updates the home area for each color
    for i in ('R1','R2','R3','R4'):
        count = -1
        #checks if the piece is still at home
        if not(i in HR_pieces):
            for j in board_image:
                count +=1
                #Checks if the board piece is
                if i in j:
                    j = j.replace(i,'xx')
                    board_image[count] = j
    for i in ('B1','B2','B3','B4'):
        count = -1
        if not(i in HB_pieces):
            for j in board_image:
                count +=1
                if i in j:
                    j = j.replace(i,'xx')
                    board_image[count] = j
    for i in ('G1','G2','G3','G4'):
        count = -1
        if not(i in HG_pieces):
            for j in board_image:
                count +=1
                if i in j:
                    j = j.replace(i,'xx')
                    board_image[count] = j
    for i in ('Y1','Y2','Y3','Y4'):
        count = -1
        if not(i in HY_pieces):
            for j in board_image:
                count +=1
                if i in j:
                    j = j.replace(i,'xx')
                    board_image[count] = j


    #uses board to write in all of the pieces for the outer ring
    for i in num_board:
        count = -1
        for j in board_image:
            count +=1
            if i in j:
                j = j.replace(i,board[num_board.index(i)])
                board_image[count] = j


    #updates the center 4 final areas of the board
    for i in ('r1','r2','r3','r4'):
        count = -1
        for j in board_image:
            count+=1
            if i in j:
                j = j.replace(i,R_final[('r1','r2','r3','r4').index(i)])
                board_image[count] = j
    for i in ('g1','g2','g3','g4'):
        count = -1
        for j in board_image:
            count+=1
            if i in j:
                j = j.replace(i,G_final[('g1','g2','g3','g4').index(i)])
                board_image[count] = j
    for i in ('y1','y2','y3','y4'):
        count = -1
        for j in board_image:
            count+=1
            if i in j:
                j = j.replace(i,Y_final[('y1','y2','y3','y4').index(i)])
                board_image[count] = j
    for i in ('b1','b2','b3','b4'):
        count = -1
        for j in board_image:
            count+=1
            if i in j:
                j = j.replace(i,B_final[('b1','b2','b3','b4').index(i)])
                board_image[count] = j


   


    for i in board_image:        
        print(i)
   


def add_piece(die_num,turn_color):
    '''Calling this function takes in the parameter of the die number that was rolled and the color that wants to add a piece.
    if the number rolled is a 6 then it will add a piece and for the color after it checks all of the rules were follewed.. '''
    global can_not_add
    can_not_add = True
    ## Checks if a 6 was rolled
    if die_num == 6:
        if turn_color == 'Red':
            #checks to see if there are any pieces left to take out
            if len(HR_pieces) == 0:
                can_not_add = True
                return print("All of your pieces are already on the board")
            #Checks to see if their own color is already on the start spot
            if board[0] in 'R1 R2 R3 R4':
                can_not_add = True
                return print("There is already one of your pieces pieces at the start. You cannot take another piece out")
            #checks to see if there is a different color at the starting place
            if board[0] != 'oo':
                R_pieces[HR_pieces[0]] = 0
                send_home(board[0],HR_pieces[0],0)
                HR_pieces.remove(HR_pieces[0])
                can_not_add = False
                return
           
            #adds piece to the dictionary
            R_pieces[HR_pieces[0]] = 0
            #adds piece to the board list
            board[0] = HR_pieces[0]
            #removes the piece from the list of the pieces at home
            HR_pieces.remove(HR_pieces[0])
            can_not_add = False
            return


        if turn_color =='Blue':
            if len(HB_pieces) == 0:
                can_not_add = True
                return print("All of your pieces are already on the board")
            if board[21] in 'B1 B2 B3 B4':
                can_not_add = True
                return print("There is already one of your pieces pieces at the start. You cannot take another piece out")
            #checks to see if there is a different color at the starting place
            if board[21] != 'oo':
                B_pieces[HB_pieces[0]] = 0
                send_home(board[21],HB_pieces[0],21)
                HB_pieces.remove(HB_pieces[0])
                can_not_add = False
                return
           
            B_pieces[HB_pieces[0]] = 0
            board[21] = HB_pieces[0]
            HB_pieces.remove(HB_pieces[0])
            can_not_add = False
            return


        if turn_color =='Green':
            if len(HG_pieces) == 0:
                can_not_add = True
                return print("All of your pieces are already on the board")
            if board[7] in 'G1 G2 G3 G4':
                can_not_add = True
                return print("There is already one of your pieces pieces at the start. You cannot take another piece out")
            if board[7] != 'oo':
                G_pieces[HG_pieces[0]] = 0
                send_home(board[7],HG_pieces[0],7)
                HG_pieces.remove(HG_pieces[0])
                can_not_add = False
                return
            G_pieces[HG_pieces[0]] = 0
            board[7] = HG_pieces[0]
            HG_pieces.remove(HG_pieces[0])
            can_not_add = False
            return


        if turn_color =='Yellow':
            if len(HY_pieces) == 0:
                can_not_add = True
                return print("All of your pieces are already on the board")
            if board[14] in 'Y1 Y2 Y3 Y4':
                can_not_add = True
                return print("There is already one of your pieces pieces at the start. You cannot take another piece out")
            if board[14] != 'oo':
                Y_pieces[HY_pieces[0]] = 0
                send_home(board[14],HY_pieces[0],14)
                HY_pieces.remove(HY_pieces[0])
                can_not_add = False
                return
            Y_pieces[HY_pieces[0]] = 0
            board[14] = HY_pieces[0]
            HY_pieces.remove(HY_pieces[0])
            can_not_add = False
            return


    ##prints out this statement if they did not roll a 6
    else:
        can_not_add = True
        return print("You did not roll a 6 so you can not add a piece")
   


def turn_color(turn) : ## returns letter of color that's currently rolling
    ''' takes in the turn number as a parameter to determine what color's turn it is '''
    if turn % 4 == 0 :
        return 'Red'
    elif turn % 4 == 1 :
        return 'Green'
    elif turn % 4 == 2 :
        return 'Yellow'
    else :
        return 'Blue'
   


def roll_dice() :
    '''returns a random number from 1-6'''
    dice = [1, 2, 3, 4, 5, 6]
    return random.choice(dice)




def move_piece(dice_roll, color, piece):
    '''takes in the parameters of the value of the dice roll, color that is moving, and which piece they want to move.
    Based off these parameters it will move the chosen piece to its new location according to the dice roll '''
    global can_not_move
    can_not_move = False
   
    if color == 'Red':
        start = 0
        if R_pieces[piece] == 31:
            can_not_move = True
            return print('This piece cannot move anymore')
       
        elif R_pieces[piece] >=28:#moving the pieces in the final area
            attempt = R_pieces[piece] + dice_roll
            if attempt > 31: # checks if they rolled too high
                can_not_move = True
                return print('You cannot move this piece. You rolled too high')
            elif R_final[attempt-28] != 'oo':#checks if there is already a piece there
                can_not_move = True
                return print('You cannot move there. You already have a piece there')
            else:
                R_pieces[piece] += dice_roll
                x = R_final.index(piece)
                R_final[x] = 'oo'
                R_final[attempt-28] = piece
                return


        elif R_pieces[piece] >= 22:
            #check if it makes it into the final or if it goes over
            attempt = R_pieces[piece] + dice_roll - 28
            if attempt>=0 and attempt <=3:
                 if R_final[attempt] != 'oo':
                    can_not_move = True
                    return print('You cannot move there. You already have a piece there')
                 else:
                     R_pieces[piece] += dice_roll
                     R_final[attempt] = piece
                     board[board.index(piece)] = 'oo'
                     return
            elif attempt >=3:
                can_not_move=True
                return print('You rolled too high to enter the final area. You have to move another piece')
           
        #checks for normal roll
       
        orig_pos = R_pieces[piece] + start
        R_pieces[piece] += dice_roll
        board_pos = R_pieces[piece] + start ## position relative to board (all other pieces)
        if board_pos > 27 :
            board_pos -= 28
        if orig_pos > 27:
            orig_pos -=28


        #checks if one of their own pieces is already there on the board and places piece
        if board[board_pos] in 'R1 R2 R3 R4':
            can_not_move = True
            return print('You can\'t move this piece into that spot. There is already one of your pieces there.')
        #checks if there is already a piece there and sends it home if true
        elif board[board_pos] != 'oo':
            board[orig_pos] = 'oo'
            send_home(board[board_pos],piece, board_pos)
            return
        else:
            board[orig_pos] = 'oo'
            board[board_pos] = piece
            return
   
    if color == 'Green':
        start = 7
        if G_pieces[piece] == 31:
            can_not_move = True
            return print('This piece cannot move anymore')
        elif G_pieces[piece] >=28:#moving the pieces in the final area
            attempt = G_pieces[piece] + dice_roll
            if attempt > 31: # checks if they rolled too high
                can_not_move = True
                return print('You cannot move this piece. You rolled too high')
            elif G_final[attempt-28] != 'oo':#checks if there is already a piece there
                can_not_move = True
                return print('You cannot move there. You already have a piece there')
            else:
                G_pieces[piece] += dice_roll
                x = G_final.index(piece)
                G_final[x] = 'oo'
                G_final[attempt-28] = piece
                return  


        elif G_pieces[piece] >= 22:
            #check if it makes it into the final or if it goes over
            attempt = G_pieces[piece] + dice_roll - 28
            if attempt>=0 and attempt <=3:
                 if G_final[attempt] != 'oo':
                    can_not_move = True
                    return print('You cannot move there. You already have a piece there')
                 else:
                     G_pieces[piece] += dice_roll
                     G_final[attempt] = piece
                     board[board.index(piece)] = 'oo'
                     return
            elif attempt >=3:
                can_not_move=True
                return print('You rolled too high to enter the final area. You have to move another piece')
           
        #checks for normal roll
        orig_pos = G_pieces[piece] + start
        G_pieces[piece] += dice_roll
        board_pos = G_pieces[piece] + start ## position relative to board (all other pieces)
        if board_pos > 27 :
            board_pos -= 28
        if orig_pos > 27:
            orig_pos -=28


        #checks if one of their own pieces is already there on the board and places piece
        if board[board_pos] in 'G1 G2 G3 G4':
            can_not_move = True
            return print('You can\'t move this piece into that spot. There is already one of your pieces there.')


        #checks if there is already a piece there and sends it home if true
       
        elif board[board_pos] != 'oo':
            board[orig_pos] = 'oo'
            send_home(board[board_pos],piece, board_pos)
            return
        else:
            board[orig_pos] = 'oo'
            board[board_pos] = piece
            return
       
    if color == 'Yellow':
        start = 14
        if Y_pieces[piece] == 31:
            can_not_move = True
            return print('This piece cannot move anymore')
       
        elif Y_pieces[piece] >=28:#moving the pieces in the final area
            attempt = Y_pieces[piece] + dice_roll
            if attempt > 31: # checks if they rolled too high
                can_not_move = True
                return print('You cannot move this piece. You rolled too high')
            elif Y_final[attempt-28] != 'oo':#checks if there is already a piece there
                can_not_move = True
                return print('You cannot move there. You already have a piece there')
            else:
                Y_pieces[piece] += dice_roll
                x = Y_final.index(piece)
                Y_final[x] = 'oo'
                Y_final[attempt-28] = piece
                return  


        elif Y_pieces[piece] >= 22:
            #check if it makes it into the final or if it goes over
            attempt = Y_pieces[piece] + dice_roll - 28
            if attempt>=0 and attempt <=3:
                 if Y_final[attempt] != 'oo':
                    can_not_move = True
                    return print('You cannot move there. You already have a piece there')
                 else:
                     Y_pieces[piece] += dice_roll
                     Y_final[attempt] = piece
                     board[board.index(piece)] = 'oo'
                     return
            elif attempt >=3:
                can_not_move=True
                return print('You rolled too high to enter the final area. You have to move another piece')
           
        #checks for normal roll
        orig_pos = Y_pieces[piece] + start
        Y_pieces[piece] += dice_roll
        board_pos = Y_pieces[piece] + start ## position relative to board (all other pieces)
        if board_pos > 27 :
            board_pos -= 28
        if orig_pos > 27:
            orig_pos -=28


        #checks if one of their own pieces is already there on the board and places piece
        if board[board_pos] in 'Y1 Y2 Y3 Y4':
            can_not_move = True
            return print('You can\'t move this piece into that spot. There is already one of your pieces there.')
        #checks if there is already a piece there and sends it home if true
        elif board[board_pos] != 'oo':
            board[orig_pos] = 'oo'
            send_home(board[board_pos],piece, board_pos)
            return
        else:
            board[orig_pos] = 'oo'
            board[board_pos] = piece
            return
       
    if color == 'Blue':
        start = 21
        if B_pieces[piece] == 31:
            can_not_move = True
            return print('This piece cannot move anymore')
       
        elif B_pieces[piece] >=28:#moving the pieces in the final area
            attempt = B_pieces[piece] + dice_roll
            if attempt > 31: # checks if they rolled too high
                can_not_move = True
                return print('You cannot move this piece. You rolled too high')
            elif B_final[attempt-28] != 'oo':#checks if there is already a piece there
                can_not_move = True
                return print('You cannot move there. You already have a piece there')
            else:
                B_pieces[piece] += dice_roll
                x = B_final.index(piece)
                B_final[x] = 'oo'
                B_final[attempt-28] = piece
                return


        elif B_pieces[piece] >= 22:
            #check if it makes it into the final or if it goes over
            attempt = B_pieces[piece] + dice_roll - 28
            if attempt>=0 and attempt <=3:
                 if B_final[attempt] != 'oo':
                    can_not_move = True
                    return print('You cannot move there. You already have a piece there')
                 else:
                     B_pieces[piece] += dice_roll
                     B_final[attempt] = piece
                     board[board.index(piece)] = 'oo'
                     return
            elif attempt >=3:
                can_not_move=True
                return print('You rolled too high to enter the final area. You have to move another piece')
           
        #checks for normal roll
        orig_pos = B_pieces[piece] + start
        B_pieces[piece] += dice_roll
        board_pos = B_pieces[piece] + start ## position relative to board (all other pieces)
        if board_pos > 27 :
            board_pos -= 28
        if orig_pos > 27:
            orig_pos -=28


        #checks if one of their own pieces is already there on the board and places piece
        if board[board_pos] in 'B1 B2 B3 B4':
            can_not_move = True
            return print('You can\'t move this piece into that spot. There is already one of your pieces there.')
        elif board[board_pos] != 'oo':
            board[orig_pos] = 'oo'
            send_home(board[board_pos],piece, board_pos)
            return
        else:
            board[orig_pos] = 'oo'
            board[board_pos] = piece
            return
 
def check_winner():
    '''Checks if there all the pieces are in the final area for any given color and returns the color that won if that is true'''
    global playing
    if not('oo' in R_final):
        playing = False
        return 'Red'
    if not('oo' in G_final):
        playing = False
        return 'Green'
    if not('oo' in Y_final):
        playing = False
        return 'Yellow'
    if not('oo' in B_final):
        playing = False
        return 'Blue'
    return ''


       
           
def send_home(og_piece, new_piece, board_pos):
    '''This function takes in the parameters of the piece that is taken off the board and sent home, the place that is replacing it, and the postion on the board.
    This function removes the original piece and replaces it with the new on in the board list and the dictionary'''
    #sets the board list to the new piece
    board[board_pos] = new_piece
    if og_piece in R_pieces:
        del R_pieces[og_piece]
        HR_pieces.append(og_piece)
       
    elif og_piece in G_pieces:
        del G_pieces[og_piece]
        HG_pieces.append(og_piece)




    elif og_piece in Y_pieces:
        del Y_pieces[og_piece]
        HY_pieces.append(og_piece)


    elif og_piece in B_pieces:
        del B_pieces[og_piece]
        HB_pieces.append(og_piece)




    # Find the opponent's piece and send it back to the start position
    print(f'{og_piece} is being sent back to home.')




playing = True
can_not_add = True
can_not_move = True


turn = 0
while playing: #code continues until playing is False
    print_board() #prints the empty board
    color = turn_color(turn)
    print(f'It is {color}\'s turn')
    input('Press any key to roll: ')
    dice_val = roll_dice()
    print(f'{str(dice_val)} was rolled')
    if dice_val == 6:     #only gives the option to add a piece if a 6 was rolled
        print('(a) -- add piece to board')
        print('(m) -- move piece')
        print('(s) -- skips your turn')
        print('(e) -- ends the game')
        print()
    else:
        print('(m) -- move piece')
        print('(s) -- skips your turn')
        print('(e) -- ends the game')
        print()
    can_not_add = True
    can_not_move= True
    while can_not_add and can_not_move : #continues to ask what the user would like to do until an action is ran
        action = input('What would you like to do: ')
        if action == 'a': #if the user wants to add a piece
            add_piece(dice_val,color)


        if action == 'm': # if the user wants to move a piece
            has_pieces = True
            if color == "Red": # checks if they have any pieces on the board
                if len(R_pieces) == 0:
                    print('You have no pieces to move')
                    has_pieces = False
                for key in R_pieces:
                    print(key,end=',')
                print()
            if color == "Blue":
                if len(B_pieces) == 0:
                    print('You have no pieces to move')
                    has_pieces = False
                for key in B_pieces:
                    print(key,end=',')
                print()
            if color == "Green":
                if len(G_pieces) == 0:
                    print('You have no pieces to move')
                    has_pieces = False
                for key in G_pieces:
                    print(key,end=',')
                print()
            if color == "Yellow":
                if len(Y_pieces) == 0:
                    print('You have no pieces to move')
                    has_pieces = False
                for key in Y_pieces:
                    print(key,end=',')
                print()
            while has_pieces: # gives an error statement if they enter an invalid piece name
                try:
                    piece = input('Which piece would you like to move ')
                    move_piece(dice_val,color,piece)
                    break
                except:
                    print('That is not a valid piece name')
           
        if action == 's': #if they have to skip their turn
                print('Turn skipped')
                break
        if action == 'e': # if they want to stop playing the game
            print('You ended the game')
            playing = False
            break


   
    color_winner = check_winner() #checks if there is a winner and sets the winner name to a color variable if true


    if dice_val != 6: #adds to the turn number if they did not roll a 6
        turn +=1
    if dice_val == 6 and playing : #if they rolled a 6 that color gets to go again
        print(f'You rolled a 6, go again. ')
   
if len(color_winner) > 0:
    print()
    print()
    print(f'The game is over, {color_winner} won!!!!!')
       
