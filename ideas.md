    generate a random line x rooms. (empty, just the first 4 flags) 
    store every Off room path in a list. Iterate through the list and generate the side halls and remove that room from the list until list is empty
    new rooms can append to the list that they need generation.
    
    could look like this one sec
    
    -----------------------------------
    -----------------------------------
    -----------║----║-----------║------
    -----------╚══╦═╚╗--╔════╦═╦╩═╗----
    --------------║--╠══╝----║-║--║----
    --------------╚══╣-------╠═╩══-----
    -----------------╠═╗-----║---------
    -----------------X-║-----╚══┉------
    -------------------╚╗--------------
    --------------------║--------------
    --------------------║--------------
    -----------------------------------
    -----------------------------------
    -----------------------------------
    -----------------------------------
    
    [[0,2,[0,1]],[T]]
    
    Okay the pattern is: Generate path to exit then 
    create other dead end paths and then create side hallways?
    it will gen the rooms with 1-4 doors
    1 door is dead end
    2 is hall/turn
    3 is branch
    4 is intersection
    
    understandable
    
    above is how i want the interperator to display it ^
    we do have symbols like 
    ⛔
    ☐
    ☑
    ☒
    
    Yeah we should make a map and see how to generate --Yes
    
    trying to visually show how the gen works
    
    Yeah