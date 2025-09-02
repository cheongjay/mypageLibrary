## Bean 의 Scope Singleton, Prototype에 따른 빈 객체 생성 시점 비교하기

### 이 포스트를 쓰게 된 배경

- 여러 클래스(HeatTask, Timer, User) 에서 한 클래스(Microwave)에 대해 공통적으로 의존성을 갖는 전자레인지 프로그램을 제작하다가, 여러 클래스에서 의존 중인 Microwave가 같은 인스턴스일까?에 대한 의문에서 시작되었다.
- 그래서 의존하고 있는 각 Microwave 인스턴스의 주소를 출력했을 때 동일하게 나왔고, 이를 통해 Spring의 컨텍스트는 인스턴스를 한 개만 생성하는 싱글톤 패턴으로 방식으로 동작함을 알 수 있었다.
- 그렇다면 서로 다른 인스턴스를 갖게 할 수 있는 방법은 없을까? 라는 의문으로 이어졌고, Scope에 대해 알게 되고 Scope에 앞서 발견한 Singleton 뿐만 아니라 Prototype이 있다는 것도 알게 되었다.
- 이 후 공통 의존성인 Microwave에 Prototype 스코프를 설정하고 코드를 실행해보는 과정에서, **Singleton과 Prototype 에 따라 빈 객체 인스턴스가 생성되는 시점이 다르다**는 것을 발견하였다. 이를 알아보기 알아보기 위해 포스트를 작성한다.

### **상황**

- **Class  이름 - 필요한 의존성**
    - **Microwave** - 다른 클래스에 대한 의존성 **없음**
        
        ```java
        // Microwave 클래스의 생성자
        public Microwave()  //★
        {
                super();
                this.isOpened = false;
                this.isRunning = false;
                this.temperature = 20;
                System.out.println(System.identityHashCode(this)+"----micro");
            }
        ```
        
    - **Timer** - **Microwave** 에 대한 의존성 **필요**
        
        ```java
        // Timer 클래스의 생성자
        public Timer(Microwave microwave) //★
        { 
            super();
            this.microwave = microwave;
              System.out.println(System.identityHashCode(microwave)+"----timer");
        }
        
        ```
        
    - **HeatTask** - **Microwave** 에 대한 의존성 **필요**
        
        ```java
        // HeatTask 클래스의 생성자
        public HeatTask(Microwave microwave)  //★
        {
            super();
            this.microwave = microwave;
              System.out.println(System.identityHashCode(microwave)+"----heat");
        }
        ```
        
    - **User** - **Microwave** 에 대한 의존성 **필요**
        
        ```java
        // User 클래스의 생성자
        public User(@Value("10")int userNum, Microwave microwave) //★
        {
            this.userNum = userNum;
            this.microwave = microwave;
            this.scanner = new Scanner(System.in);
              System.out.println(System.identityHashCode(microwave)+"----user");
        }
        ```
        
- **Class 와 Scope 설정**
    - Microwave - Prototype `@Scope(ConfigurableBeanFactory.*SCOPE_PROTOTYPE*)`
    - HeatTask, Timer, User - default scope == Singleton
    

### 시나리오

- 이 4개의 클래스들은 모두 `@Component` 어노테이션을 갖고 있기 때문에, Bean 객체로 관리됨.
- Microwave에 의존 중인 세 개의 클래스(HeatTask, Timer, User) 생성자에서는 Microwave 객체 인스턴스의 주소를 출력하는 코드를 갖고 있음.
    
    `System.out.println(System.identityHashCode(microwave)+"----클래스이름");` 
    
- Microwave는 `this` 키워드를 통해 자신의 인스턴스 주소를 출력하고 있음.
    
    `System.out.println(System.identityHashCode(this)+"----micro");` 
    
- 이때 **MicrowaveMain**라는 **메인** 클래스에서 **위의 4개의 클래스들을 관리하는 컨텍스트**를 만들고, **getBean() 메서드**를 통해 **각각의 클래스의 객체 생성을 요청**하면 어떻게 될까?
- MicrowaveMain 메인 클래스에서 각 클래스의 **객체 생성 요청 순서는** 다음과 같다.
    
    : Microwave → Timer → HeatTask → User
    
    - MicrowaveMain 코드 전문
        
        ```java
        package dev.syntax;
        
        import dev.syntax.model.Microwave;
        import dev.syntax.thread.HeatTask;
        import dev.syntax.thread.Timer;
        import dev.syntax.thread.User;
        import org.springframework.context.ApplicationContext;
        import org.springframework.context.annotation.AnnotationConfigApplicationContext;
        
        import java.sql.Time;
        
        public class MicrowaveMain {
            public static void main(String[] args) {
                ApplicationContext context
                        = new AnnotationConfigApplicationContext("dev.syntax");
        
                Microwave microwave = context.getBean(Microwave.class); //★
                System.out.println("Main에서의 microwave = " + System.identityHashCode(microwave));
        
                Timer timer = context.getBean(Timer.class); //★
                HeatTask heat = context.getBean(HeatTask.class); //★
                User user = context.getBean(User.class); //★
        
                microwave.addListener(heat);
                microwave.addListener(timer);
        
                Thread timerThread = new Thread(timer);
                Thread heatThread = new Thread(heat);
                Thread userThread = new Thread(user);
        
                userThread.start();
                timerThread.start();
                heatThread.start();
            }
        }
        ```
        

### 예상 결과

: 메인에서 **Microwave → Timer → HeatTask → User** 순서대로 **getBean을 호출**하니, **출력 순서**도 똑같이 출력된다고 예상. (저 숫자들은 인스턴스의 주소로 값은 큰 의미는 없다.)

```java
904861801----micro
Main에서의 microwave = 904861801
494317290----micro
494317290----timer
1908981452----micro
1908981452----heat
6750210----micro
6750210----user
```

### 실제 결과

: **HeatTask → Timer → User → Microwave** 순으로 호출. 전혀 예상하지 못한 순서..

```java
1908981452----micro
1908981452----heat
494317290----micro
494317290----timer
6750210----micro
6750210----user
904861801----micro
Main에서의 microwave = 904861801
```

![image.png](image.png)

### 왜 그럴까? Spring의 공식 문서를 찾아보자!

- **Bean Scopes**에 대한 문서에서 관련 내용을 확인할 수 있었다.
    
    ![image.png](image%201.png)
    
    - **싱글톤** - **컨테이너 당 싱글 인스턴스 객체**를 갖는다고 한다.
    - **프로토타입** - **하나의 빈 정의**에 대해 **몇 개의 인스턴스**를 가질 수 있다 = 즉 **여러 인스턴스 생성 가능**하다.
    
    공식 문서 아래를 더 읽어보자.
    
    **Singleton Scope**에 대한 자세한 설명이다.
    
    읽어봤을 때, **IoC 컨테이너가 정확히 하나의 빈 객체 인스턴스를 만든다**고 나와있다.
    
    ![image.png](image%202.png)
    
    Prototype Scope 에 대한 자세한 설명이다.
    
    읽어봤을 때 getBean() 메서드를 호출했을 때 그 때 bean이 주입된다는 것을 알 수 있다.
    
    ![image.png](image%203.png)
    
    그 아래를 더 읽어보자.
    
    **프로토타입 빈(Microwave) 의존성을 갖고 있는 싱글톤 빈(HeatTask, Timer, User)**
    
    즉 내 코드 상황과 딱 들어맞는 설명을 찾을 수 있었다.
    
    여기서는 싱글톤 빈에 프로토타입 빈 의존성이 주입될 때 새로운 프로토타입 빈이 인스턴스화된다고 나와있다.
    
    또한 프로토타입 인스턴스가 싱글톤 빈에 sole(단독의) instance 로 주입된다는 것을 알 수 있다.
    
    ![image.png](image%204.png)
    

### 공식 문서를 통한 추론

공식 문서를 읽고 세 가지 추론을 할 수 있었다.

1. **Singleton** scope Bean - **컨테이너가 생성**될 때 해당 인스턴스도 같이 만들어질 것이다,
2. **Prototype** scope Bean - **getBean**이라는 메소드를 호출하거나, 혹은 **이 빈을 의존하고 있는 다른 클래스가 인스턴스화될 때** 인스턴스가 만들어질 것이다.
3. 즉, 메인에서 getBean() 호출 순서는 `Microwave` →`Timer` →`HeatTask` →`User` 이지만,
    
    싱글톤으로 스코프가 정의돼있는 HeatTask, Timer, User는 컨텍스트가 생성될 때, 인스턴스가 함께 생성되고, 
    
    `ApplicationContext context = new AnnotationConfigApplicationContext("dev.syntax");`
    
    그 이후에 프로토타입인 Microwave는 getBean이 호출되었을 때 그때서야 인스턴스를 만들 것이다.
    

### 추론을 증명해보자!

1. **메인 코드에서 context를 정의하는 코드를 제외하고 주석하여 실행해보자!**
    
    ![image.png](image%205.png)
    
    - **출력 결과 해석**
        
        싱글톤 객체인 heat, timer, user에 대해서만 출력됐다.
        
        이를 통해 **컨텍스트가 생성**될 때 **싱글톤 빈들은 모두 인스턴스화됨**을 알 수 있다.
        
2. **Microwave를 싱글톤으로 바꾸어서 실행해보자!**
    
    ```java
    @Component
    //@Scope(ConfigurableBeanFactory.SCOPE_PROTOTYPE)
    public class Microwave {
    ```
    
    ![image.png](image%206.png)
    
    - **출력 결과 해석**
        
        Microwave가 싱글톤이 되었기 때문에, 이를 의존하는 다른 객체 인스턴스들이 생성될 때도 맨 처음에 만든 Microwave 객체가 재활용돼서 **인스턴스 주소가 한 번씩만 출력**되고, **주소도 모두 동일함**을 알 수 있다.
        
3. **Microwave를 다시 프로토타입으로 만들고 getBean을 호출해보자!**
    
    ![image.png](image%207.png)
    
    - **출력 결과 해석**
        
        파란색 부분은 1번과 동일하고, getBean()이 호출될 때 그때서야 microwave 인스턴스가 만들어졌다. 즉 프로토타입 빈은 요청이 들어올 때마다 새로 생성됨을 알 수 있다.
        
    

### 결론

- Singleton Scope의 Bean은 컨텍스트가 생성되면서 함께 인스턴스화된다.
- Prototype Scope의 Bean은 getBean() 처럼 인스턴스를 요청받을 때 새로운 인스턴스를 만든다.
- 만약 Singleton Scope의 Bean에서 Prototype Scope의 Bean을 생성자의 매개변수로 의존하고 있을 경우, Singleton Scope의 Bean이 인스턴스화되는 시점인 컨텍스트 생성 시점에 Prototype Scope의 Bean 인스턴스도 함께 생성된다.
- 추가로 공식 문서에서도 프로토타입 스코프는 stateful Bean에 대해서, 싱글톤은 stateless Bean에 대해서 사용하라고 강조하고 있다.
    
    ![이 내용은 뭔가 싱글톤 빈이 공유자원처럼 쓰일 수 있기 때문일 것으로 예상하지만… 다음에 자세히 다뤄보겠당.](image%208.png)
    
    이 내용은 뭔가 싱글톤 빈이 공유자원처럼 쓰일 수 있기 때문일 것으로 예상하지만… 다음에 자세히 다뤄보겠당.
    

### 다음 주제

prototype은 configured destruction lifecycle 콜백(빈이 소멸될 때 호출되는 콜백 함수)이 호출되지 않는다는 것을 발견할 수 있었다. 이 내용을 다음엔 파보고 싶다!

![image.png](image%209.png)