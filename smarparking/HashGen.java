public class HashGen {
    public static void main(String[] args) {
        System.out.println(org.mindrot.jbcrypt.BCrypt.hashpw("123", org.mindrot.jbcrypt.BCrypt.gensalt(10)));
    }
}
