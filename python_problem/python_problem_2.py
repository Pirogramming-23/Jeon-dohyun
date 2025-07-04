# 학생 정보 처리 프로그램

# 학생 정보를 저장할 딕셔너리 (전역 변수)
students = {}

##############  menu 1
def Menu1(name, score1, score2):
    """학생 정보를 사전에 저장하는 함수"""
    students[name] = {
        'midterm': score1,
        'final': score2,
        'grade': None  # 학점은 아직 부여되지 않음
    }
    print(f"{name} student information is saved.")

##############  menu 2
def Menu2():
    """학점 부여 하는 함수"""
    for name, info in students.items():
        if info['grade'] is None:  # 학점이 부여되지 않은 학생만
            average = (info['midterm'] + info['final']) / 2
            if average >= 90:
                grade = 'A'
            elif average >= 80:
                grade = 'B'
            elif average >= 70:
                grade = 'C'
            else:
                grade = 'D'
            students[name]['grade'] = grade

##############  menu 3
def Menu3():
    """학생 정보 출력 함수"""
    print("---------------------")
    print("name  mid  final  grade")
    print("---------------------")
    for name, info in students.items():
        print(f"{name}   {info['midterm']}   {info['final']}     {info['grade']}")

##############  menu 4
def Menu4(name):
    """학생 정보 삭제하는 함수"""
    del students[name]

# 메인 프로그램
print("*Menu*******************************")
print("1. Inserting students Info(name score1 score2)")
print("2. Grading")
print("3. Printing students Info")
print("4. Deleting students Info")
print("5. Exit program")
print("*************************************")

while True:
    choice = input("Choose menu 1, 2, 3, 4, 5 : ")
    
    if choice == "1":
        # 학생 정보 입력받기
        data = input("Enter student information (name midterm final): ").split()
        
        # 예외사항 처리: 데이터 입력 갯수
        if len(data) != 3:
            print("Invalid data count!")
            continue
        
        name = data[0]
        
        # 예외사항 처리: 이미 존재하는 이름
        if name in students:
            print("Already exist name!")
            continue
        
        # 예외사항 처리: 입력 점수 값이 양의 정수인지
        try:
            score1 = int(data[1])
            score2 = int(data[2])
            if score1 <= 0 or score2 <= 0:
                print("Score must be positive integer!")
                continue
        except ValueError:
            print("Score must be positive integer!")
            continue
        
        # 예외사항이 아닌 입력인 경우 1번 함수 호출
        Menu1(name, score1, score2)

    elif choice == "2":
        # 예외사항 처리: 저장된 학생 정보의 유무
        if not students:
            print("No student data!")
            continue
        
        # 예외사항이 아닌 경우 2번 함수 호출
        Menu2()
        print("Grading to all students.")

    elif choice == "3":
        # 예외사항 처리: 저장된 학생 정보의 유무
        if not students:
            print("No student data!")
            continue
        
        # 예외사항 처리: 저장되어 있는 학생들의 학점이 모두 부여되어 있는지
        has_ungraded = any(info['grade'] is None for info in students.values())
        if has_ungraded:
            print("There are students who didn't get grade!")
            continue
        
        # 예외사항이 아닌 경우 3번 함수 호출
        Menu3()

    elif choice == "4":
        # 예외사항 처리: 저장된 학생 정보의 유무
        if not students:
            print("No student data!")
            continue
        
        # 삭제할 학생 이름 입력 받기
        name = input("Enter student name to delete: ")
        
        # 입력 받은 학생의 존재 유무 체크
        if name not in students:
            print("Not exist name!")
            continue
        
        # 학생이 존재하면 4번 함수 호출
        Menu4(name)
        print(f"{name} student information is deleted.")

    elif choice == "5":
        # 프로그램 종료 메세지 출력
        print("Program is terminated.")
        break

    else:
        # 잘못된 번호 입력 처리
        print("Wrong number. Choose again.")