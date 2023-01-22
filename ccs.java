 import java.lang.System;
 import java.io.*;
 import java.util.Scanner;

 class ccs{
    public static String prompt(){
        System.out.println("Please give the file path to your credit card statement:");
        Scanner input = new Scanner(System.in);
        String filename = input.nextLine().trim();
        System.out.println("You entered: " + filename + ", is this path correct?");
        String check = input.next().trim();
        if(!check.equalsIgnoreCase("yes")){
            input.close();
            prompt();
        }
        input.close();
        return filename;
    }   

    public static void parse(String filename){
        try{
            File file = new File(filename);
            System.out.println(filename);
            Scanner reader = new Scanner(file);
            while(reader.hasNextLine()){
                String data = reader.nextLine();
                System.out.println(data);
            }
            reader.close();
        } catch(Exception e){
            System.out.println("An Error occurred:" );
            e.printStackTrace();
        }
    }   

    public static void main(String[] args){
        System.out.println("hi");
        String filename = prompt();
        parse(filename);
    }
}