
  const [users, setUsers] = useState([]);

  useEffect(() => {
    async function datas() {
      try {
        const data = await fetchApi(
          `teachers`,
        );
        if (data.status === 200) {
          setUsers(data.data);
        }
      } catch (error) {
        console.log(error);
      }
    }
    datas();

  }, []);
//   {users?.data?.map((row, index) => ())}


      const handleLogin = async (e) => {
        e.preventDefault();
        try {
          const res = await fetchApi.post("auth/login", {
            phone: login,
            password: password
          });
        } catch (error) {
          console.log(error);
        }
      };